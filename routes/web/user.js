const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/user.js');
const Bill = require('../../models/bill.js');
const billstatus = require("../../constants/billstatus.js");


const router = express.Router();

router.post('/adduser', async (req, res) => {
    try {
        const { name, role, status, password, confirmPassword } = req.body;
        console.log(req.body)
        console.log(password === confirmPassword)
        if(password === confirmPassword){
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            role,
            status,
            password: hashedPassword,
        });
        await newUser.save();

        const securityBill = new Bill({
            amount: 100, 
            dueDate: new Date(),
            status: billstatus.pendingStatus,
            userId: newUser._id,
            billType: 'security',
        });
        await securityBill.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
      }else{
        res.status(400).json({ message: 'Password does not match' });
      }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/updateuser/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, status } = req.body;

  try {
      const user = await User.findById(id);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      user.name = name || user.name;
      user.role = role || user.role;
      user.status = status || user.status;

      await user.save();

      res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
router.delete('/deleteuser/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Bill.deleteMany({ userId: user._id });

        res.status(200).json({ message: 'User and associated bills deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/bills/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const bills = await Bill.find({ userId });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/bills/pay', async (req, res) => {
  try {
    const { billId } = req.body;

    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      { status: billstatus.PaidStatus},
      { new: true }
    );
    res.json({ message: 'Bill marked as paid', bill: updatedBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/newbills', async (req, res) => {
  try {
    const { amount, dueDate, status, userId, billType } = req.body;
    const newBill = new Bill({
      amount,
      dueDate,
      status,
      userId,
      billType
    });
    await newBill.save();
    res.status(201).json({ message: 'Bill created successfully', bill: newBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/updatebills/:id', async (req, res) => {
  try {
    const { amount, dueDate, status, userId, billType } = req.body;
    const { id } = req.params;


    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { amount, dueDate, status, userId, billType },
      { new: true } 
    );

    if (!updatedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json({ message: 'Bill updated successfully', bill: updatedBill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/deletebills/:id', async (req, res) => {
  try {
    const { id } = req.params;


    const deletedBill = await Bill.findByIdAndDelete(id);

    if (!deletedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json({ message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/bills', async (req, res) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/users/vacate/:id', async (req, res) => {
  try {
    const userId = req.params.id;

   
    const bills = await Bill.find({ userId });
    let totalPaid = 0;
    let totalPending = 0;

    bills.forEach(bill => {
      if (bill.status === 'paid') {
        totalPaid += bill.amount;
      } else {
        totalPending += bill.amount;
      }
    });

    const refundAmount = bills.reduce((sum, bill) => {
      return bill.billType === 'security' ? sum + (bill.status === 'paid' ? bill.amount : 0) : sum;
    }, 0);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'vacated' },
      { new: true }
    );

    res.json({
      message: 'User vacated successfully',
      totalPaid,
      totalPending,
      refundAmount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
